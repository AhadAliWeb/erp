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
    public class UtilityConfigController : ControllerBase
    {
        private readonly IUtilityConfigService _utilityConfigService;

        public UtilityConfigController(IUtilityConfigService utilityConfigService)
        {
            _utilityConfigService = utilityConfigService;
        }

        [HttpGet("electricity")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetElectricityConfig()
        {
            var config = await _utilityConfigService.GetElectricityConfigAsync();
            return Ok(config);
        }

        [HttpPut("electricity")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateElectricityConfig([FromBody] UpdateUtilityConfigDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var success = await _utilityConfigService.UpdateElectricityConfigAsync(dto, userId);
                if (!success) return BadRequest(new { Message = "Failed to update electricity config" });
                return Ok(new { Message = "Electricity config updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("water")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetWaterConfig()
        {
            var config = await _utilityConfigService.GetWaterConfigAsync();
            return Ok(config);
        }

        [HttpPut("water")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateWaterConfig([FromBody] UpdateUtilityConfigDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var success = await _utilityConfigService.UpdateWaterConfigAsync(dto, userId);
                if (!success) return BadRequest(new { Message = "Failed to update water config" });
                return Ok(new { Message = "Water config updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("company-details/{tenantId}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetUtilityCompanyDetails(int tenantId)
        {
            try
            {
                var details = await _utilityConfigService.GetUtilityCompanyDetailsAsync(tenantId);
                return Ok(details);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        


    }
}