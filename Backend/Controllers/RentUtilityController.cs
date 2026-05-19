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
    public class RentUtilityController : ControllerBase
    {
        private readonly IRentUtilityService _rentUtilityService;

        public RentUtilityController(IRentUtilityService rentUtilityService)
        {
            _rentUtilityService = rentUtilityService;
        }
        [HttpGet]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetAll(int tenantId, int pageNumber = 1, int pageSize = 10, string? billingMonth = null)
        {
            var result = await _rentUtilityService.GetAllAsync(tenantId, pageNumber, pageSize, billingMonth);
            return Ok(result);
        }

        [HttpGet("mine")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> GetMine(int pageNumber = 1, int pageSize = 10, string? billingMonth = null)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _rentUtilityService.GetMineAsync(userId, pageNumber, pageSize, billingMonth);
            return Ok(result);
        }


        [HttpGet("detail/{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var utility = await _rentUtilityService.GetByIdAsync(id);
            if (utility == null) return NotFound();
            return Ok(utility);
        }

        [HttpGet("current/{tenantId}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetCurrentByTenant(int tenantId)
        {
            var utility = await _rentUtilityService.GetCurrentByTenantAsync(tenantId);
            if (utility == null) return NotFound();
            return Ok(utility);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateRentUtilityDto dto)
        {
            try
            {
                var id = await _rentUtilityService.CreateAsync(dto);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

    }
}