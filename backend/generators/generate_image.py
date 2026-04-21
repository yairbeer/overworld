"""
Generates an image from a text prompt using FLUX.1-schnell with NF4 quantization.
Optimized for 8GB VRAM GPUs.
"""

import os
from dotenv import load_dotenv

load_dotenv()

hf_token = os.getenv("HF_TOKEN")
if not hf_token:
    raise ValueError("HF_TOKEN environment variable is not set. Please set it in your .env file.")

from huggingface_hub import login
login(token=hf_token)

import torch
from pathlib import Path
from diffusers import FluxPipeline, FluxTransformer2DModel, BitsAndBytesConfig as DiffusersBitsAndBytesConfig
from transformers import BitsAndBytesConfig as TransformersBitsAndBytesConfig, T5EncoderModel

# Cache the pipeline globally so it's only loaded once per session
_pipeline = None


def load_pipeline() -> FluxPipeline:
    """Load and cache the FLUX.1-schnell pipeline with NF4 quantization."""
    global _pipeline

    if _pipeline is not None:
        return _pipeline

    print("Loading FLUX.1-schnell with NF4 quantization (first run may take a while)...")

    model_id = "black-forest-labs/FLUX.1-schnell"

    # NF4 quantization config for the transformer (DiT)
    transformer_quant_config = DiffusersBitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
    )

    # NF4 quantization config for the T5 text encoder
    text_encoder_quant_config = TransformersBitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
    )

    # Load transformer with NF4
    transformer = FluxTransformer2DModel.from_pretrained(
        model_id,
        subfolder="transformer",
        quantization_config=transformer_quant_config,
        torch_dtype=torch.bfloat16,
    )

    # Load T5 text encoder with NF4
    text_encoder_2 = T5EncoderModel.from_pretrained(
        model_id,
        subfolder="text_encoder_2",
        quantization_config=text_encoder_quant_config,
        torch_dtype=torch.bfloat16,
    )

    # Build the full pipeline with quantized components
    pipe = FluxPipeline.from_pretrained(
        model_id,
        transformer=transformer,
        text_encoder_2=text_encoder_2,
        torch_dtype=torch.bfloat16,
    )

    # Enable memory optimizations for 8GB VRAM
    pipe.enable_model_cpu_offload()
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()

    _pipeline = pipe
    print("Pipeline loaded successfully.")
    return _pipeline


def generate_image(
    prompt: str,
    output_path: str,
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 4,
    guidance_scale: float = 0.0,
    seed: int | None = None,
    prompt_2: str | None = None,
) -> str:
    """
    Generate an image from a text prompt using FLUX.1-schnell with NF4 quantization.

    Args:
        prompt:               Text description (CLIP prompt) for core subject matter.
        output_path:          File path where the image will be saved (e.g. "output/ship.png").
        width:                Image width in pixels. Default 1024.
        height:               Image height in pixels. Default 1024.
        num_inference_steps:  Number of denoising steps. schnell works well with 4.
        guidance_scale:       Classifier-free guidance scale. schnell uses 0.0 (distilled).
        seed:                 Optional random seed for reproducibility.
        prompt_2:             Optional T5 prompt for scene, style, and detailed context.
                              If provided, uses dual-prompt generation for more control.

    Returns:
        The resolved path to the saved image as a string.

    Example:
        >>> path = generate_image(
        ...     prompt="retro arcade pixel art spaceship, cyan color",
        ...     prompt_2="dark space background with stars",
        ...     output_path="assets/sprites/player_ship_concept.png"
        ... )
        >>> print(f"Image saved to: {path}")
    """
    # Ensure output directory exists
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Set up generator for reproducibility
    generator = None
    if seed is not None:
        generator = torch.Generator(device="cpu").manual_seed(seed)

    # Load pipeline (cached after first call)
    pipe = load_pipeline()

    print(f"Generating image for prompt: '{prompt[:80]}{'...' if len(prompt) > 80 else ''}'")
    if prompt_2:
        print(f"Using T5 prompt: '{prompt_2[:80]}{'...' if len(prompt_2) > 80 else ''}'")

    # Run inference
    result = pipe(
        prompt=prompt,
        prompt_2=prompt_2 if prompt_2 else prompt,
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        max_sequence_length=256,
        generator=generator,
    )

    image = result.images[0]
    image.save(str(output_file))

    print(f"Image saved to: {output_file.resolve()}")
    return str(output_file.resolve())


# ── Example usage ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Example with dual prompts for more control
    generate_image(
        prompt="small robot drone enemy, angular metal body, red glowing eye",
        prompt_2="retro arcade pixel art style, dark sci-fi environment",
        output_path="output/enemy_drone_concept_2.png",
        width=512,
        height=512,
        seed=42,
    )