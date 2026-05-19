
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
    public class BankController : ControllerBase
    {
        private readonly IBankService _bankService;

        public BankController(IBankService bankService)
        {
            _bankService = bankService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBank([FromBody] CreateBankDto dto)
        {
            try
            {
                var id = await _bankService.CreateAsync(dto);
                return Ok(new { Id = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetAllBanks()
        {
            var banks = await _bankService.GetAllAsync();
            return Ok(banks);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetBankById(int id)
        {
            var bank = await _bankService.GetByIdAsync(id);
            if (bank == null) return NotFound();
            return Ok(bank);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBank(int id)
        {
            var success = await _bankService.DeleteAsync(id);
            if (success) return Ok(new { Message = "Bank deleted successfully" });
            return BadRequest(new { Message = "Failed to delete bank" });
        }

        [HttpGet("{bankId}/transactions")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetBankTransactions(int bankId, int pageNumber = 1, int pageSize = 10, string? type = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var transactions = await _bankService.GetTransactionsAsync(bankId, pageNumber, pageSize, type, fromDate, toDate);
            return Ok(transactions);
        }

        [HttpPost("deduct")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> DeductFromBank([FromBody] DeductFromBankDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var success = await _bankService.DeductAsync(dto, userId);
                if (success) return Ok(new { Message = "Amount deducted successfully" });
                return BadRequest(new { Message = "Failed to deduct amount" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
         }
    }
}