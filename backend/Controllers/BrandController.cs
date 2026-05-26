using backend.DTOs.BrandDTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("backend/brand")]
    public class BrandController : ControllerBase
    {
        private readonly IBrandService _service;
        public BrandController(IBrandService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var brands = await _service.GetAllAsync();
            return Ok(brands);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var brand = await _service.GetByIdAsync(id);
            return Ok(brand);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateBrandDTO brandDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var createdBrand = await _service.CreateAsync(brandDTO);

            return Ok(createdBrand);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateBrandDTO brandDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updatedBrand = await _service.UpdateAsync(id, brandDTO);

            return Ok(updatedBrand);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}