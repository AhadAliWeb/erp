
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
    [Route("api/commission")]
    public class ProductionCommissionController : ControllerBase
    {
        private readonly IProductionCommissionService _commissionService;

        public ProductionCommissionController(IProductionCommissionService commissionService)
        {
            _commissionService = commissionService;
        }

        [HttpPost("slip")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> AddSlip([FromBody] CreateProductionSlipDto dto)
        {
            try
            {
                var id = await _commissionService.AddSlipAsync(dto);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("slip/{tenantId}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetSlipsByTenant(int tenantId, int pageNumber = 1, int pageSize = 10, bool? isUsed = null)
        {
            var result = await _commissionService.GetSlipsByTenantAsync(tenantId, pageNumber, pageSize, isUsed);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> CreateCommission([FromBody] CreateProductionCommissionDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var id = await _commissionService.CreateCommissionAsync(dto, userId);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetCommissionById(int id)
        {
            var commission = await _commissionService.GetCommissionByIdAsync(id);
            if (commission == null) return NotFound();
            return Ok(commission);
        }

        [HttpPost("voucher")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateProductionVoucherDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var id = await _commissionService.CreateVoucherAsync(dto, userId);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("voucher/{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetVoucherById(int id)
        {
            var voucher = await _commissionService.GetVoucherByIdAsync(id);
            if (voucher == null) return NotFound();
            return Ok(voucher);
        }

        [HttpGet("voucher/tenant/{tenantId}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetVouchersByTenant(int tenantId, int pageNumber = 1, int pageSize = 10, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var result = await _commissionService.GetVouchersByTenantAsync(tenantId, pageNumber, pageSize, fromDate, toDate);
            return Ok(result);  

        }





    }
}