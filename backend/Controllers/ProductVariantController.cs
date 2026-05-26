using backend.DTOs.ProductDTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("backend/product")]
    public class ProductVariantController : ControllerBase
    {
        private readonly IProductVariantService _service;
        public ProductVariantController(IProductVariantService service)
        {
            _service = service;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{productId:int}/variant")]
        public async Task<IActionResult> CreateAsync([FromRoute] int productId, [FromBody] CreateProductVariantDTO variantDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdVariant = await _service.CreateAsync(productId, variantDTO);
            return Ok(createdVariant);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{productId:int}/variant/{id:int}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromRoute] int productId, [FromBody] UpdateProductVariantDTO variantDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updatedVariant = await _service.UpdateAsync(id, productId, variantDTO);

            return Ok(updatedVariant);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("variant/{id:int}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("volumes")]
        public async Task<IActionResult> GetVolumes()
        {
            var volumes = await _service.GetVolumesAsync();
            return Ok(volumes);
        }
    }
}