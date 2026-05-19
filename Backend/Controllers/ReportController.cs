using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Interfaces;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/report")]
    [Authorize(Roles = "Manager,Admin")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("tenants")]
        public async Task<IActionResult> GetTenantReport()
        {
            var fileBytes = await _reportService.GetTenantReportAsync();
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "tenants.xlsx");
        }

        [HttpGet("bank-transactions/{bankId}")]
        public async Task<IActionResult> GetBankTransactionsReport(
            int bankId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var fileBytes = await _reportService.GetBankTransactionsReportAsync(bankId, fromDate, toDate);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"bank-transactions-{bankId}.xlsx");
        }

        [HttpGet("tenant-bills/{tenantId}")]
        public async Task<IActionResult> GetTenantBillsReport(int tenantId)
        {
            var fileBytes = await _reportService.GetTenantBillsReportAsync(tenantId);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"tenant-bills-{tenantId}.xlsx");
        }

        [HttpGet("outstanding")]
        public async Task<IActionResult> GetOutstandingReport()
        {
            var fileBytes = await _reportService.GetOutstandingReportAsync();
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "outstanding.xlsx");
        }

        [HttpGet("receivables")]
        public async Task<IActionResult> GetReceivablesReport()
        {
            var fileBytes = await _reportService.GetReceivablesReportAsync();
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "receivables.xlsx");
        }

        [HttpGet("user-amounts")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserAmountsReport()
        {
            var fileBytes = await _reportService.GetUserAmountsReportAsync();
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "user-amounts.xlsx");
        }
    }
}