
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElectricityUtilityController : ControllerBase
    {
        private readonly IElectricityUtilityService _electricityUtilityService;

        public ElectricityUtilityController(IElectricityUtilityService electricityUtilityService)
        {
            _electricityUtilityService = electricityUtilityService;
        }

        [HttpGet]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetAll(int tenantId, int pageNumber = 1, int pageSize = 10, string? month = null)
        {
            
            var result = await _electricityUtilityService.GetAllAsync(tenantId, pageNumber, pageSize, month);
            return Ok(result);
        }

        [HttpGet("mine")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> GetMine(int pageNumber = 1, int pageSize = 10, string? month = null)
        {
            
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var result = await _electricityUtilityService.GetMineAsync(userId, pageNumber, pageSize, month);
            return Ok(result);
        }

        [HttpGet("detail/{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var utility = await _electricityUtilityService.GetByIdAsync(id);
            if (utility == null) return NotFound();
            return Ok(utility);
        }

        // GET /api/electricity/current/{tenantId} — GetCurrentByTenant [Manager, Admin]
        [HttpGet("current/{tenantId}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetCurrentByTenant(int tenantId)
        {
            var utility = await _electricityUtilityService.GetCurrentByTenantAsync(tenantId);
            if (utility == null) return NotFound();
            return Ok(utility);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateElectricityUtilityDto dto)
        {
            try
            {
                var id = await _electricityUtilityService.CreateAsync(dto);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }





    }
}
