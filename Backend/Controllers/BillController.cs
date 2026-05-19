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
    public class BillController : ControllerBase
    {
        private readonly IBillService _billService;

        public BillController(IBillService billService)
        {
            _billService = billService;
        }

        [HttpPost("payment")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var id = await _billService.CreatePaymentAsync(dto, userId);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("mine")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> GetMyPayments(string billType, int pageNumber = 1, int pageSize = 10, string? modeOfPayment = null, string? billingMonth = null)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _billService.GetMyTenantPaymentsAsync(userId, billType, pageNumber, pageSize, modeOfPayment, billingMonth);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetPaymentsByUtility(int tenantId, string billType, int pageNumber = 1, int pageSize = 10, string? modeOfPayment = null, string? billingMonth = null)
        {
            var result = await _billService.GetPaymentsByTenantAsync(tenantId, billType, pageNumber, pageSize, modeOfPayment, billingMonth);
            return Ok(result);
        }

        [HttpPost("bounce")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> ChequeBounce([FromBody] ChequeBounceDto dto)
        {
            try
            {
                var success = await _billService.ChequeBounceAsync(dto);
                if (success) return Ok(new { Message = "Cheque bounce processed successfully" });
                return BadRequest(new { Message = "Failed to process cheque bounce" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }






        
    }

}