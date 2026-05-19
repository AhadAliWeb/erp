using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;

        public TenantController(ITenantService tenantService)
        {
            _tenantService = tenantService;
        }

        [HttpGet]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetAllTenants()
        {
            var tenants = await _tenantService.GetAllTenantsAsync();
            return Ok(tenants);
        }

        [HttpGet("inactive")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetInactiveTenants()
        {
            var tenants = await _tenantService.GetInactiveTenantsAsync();
            return Ok(tenants);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetTenantById(int id)
        {
            var tenant = await _tenantService.GetTenantByIdAsync(id);
            if (tenant == null) return NotFound();
            return Ok(tenant);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> CreateTenant([FromBody] CreateTenantDto dto)
        {
            try
            {
                var tenantId = await _tenantService.CreateTenantAsync(dto);
                return Ok(new { TenantId = tenantId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateTenant(int id, [FromBody] UpdateTenantDto dto)
            {
                try
                {
                    var success = await _tenantService.UpdateTenantAsync(id, dto);
                    if (!success) return NotFound();
                    return Ok(new { Message = "Tenant updated successfully" });
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Message = ex.Message });
                }
        }

        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateTenant(int id)
        {
            try
            {
                var success = await _tenantService.DeactivateTenantAsync(id);
                if (!success) return NotFound();
                return Ok(new { Message = "Tenant deactivated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/reagreement")]
        [Authorize  (Roles = "Manager,Admin")]
        public async Task<IActionResult> CreateReAgreement(int id, [FromBody] ReAgreementDto dto)
        {
            try
            {
                var success = await _tenantService.CreateReAgreementAsync(id, dto);
                if (!success) return NotFound();
                return Ok(new { Message = "Re-agreement created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/reagreement")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetReAgreements(int id)
        {
            try
            {
                var reAgreements = await _tenantService.GetReAgreementsAsync(id);
                return Ok(reAgreements);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

    }
}