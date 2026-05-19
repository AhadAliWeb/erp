


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
    public class WaterUtilityController : ControllerBase
    {
        private readonly IWaterUtilityService _waterUtilityService;

        public WaterUtilityController(IWaterUtilityService waterUtilityService)
        {
            _waterUtilityService = waterUtilityService;
        }
        [HttpGet]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetAll(int tenantId, int pageNumber = 1, int pageSize = 10, string? month = null)
        {
            var result = await _waterUtilityService.GetAllAsync(tenantId, pageNumber, pageSize, month);
            return Ok(result);
        }

        [HttpGet("mine")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> GetMine(int pageNumber = 1, int pageSize = 10, string? month = null)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _waterUtilityService.GetMineAsync(userId, pageNumber, pageSize, month);
            return Ok(result);
        }


        [HttpGet("detail/{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var utility = await _waterUtilityService.GetByIdAsync(id);
            if (utility == null) return NotFound();
            return Ok(utility);
        }

        [HttpGet("current/{tenantId}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetCurrentByTenant(int tenantId)
        {
            var utility = await _waterUtilityService.GetCurrentByTenantAsync(tenantId);
            if (utility == null) return NotFound();
            return Ok(utility);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateWaterUtilityDto dto)
        {
            try
            {
                var id = await _waterUtilityService.CreateAsync(dto);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                // Log the exception (not implemented here)
                return StatusCode(500, "An error occurred while creating the water utility record.");
            }
        }


    }
}