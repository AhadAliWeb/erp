

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Data;



namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly AppDbContext _context;

        public DashboardController(IDashboardService dashboardService, AppDbContext context)
        {
            _dashboardService = dashboardService;
            _context = context;
        }

        [HttpGet("tenant")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> GetTenantDashboard()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.TenantId == null) return NotFound();

            var dashboard = await _dashboardService.GetTenantDashboardAsync(user.TenantId.Value);
            return Ok(dashboard);
        }

        [HttpGet("manager")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetManagerDashboard()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var dashboard = await _dashboardService.GetManagerDashboardAsync(userId);
            return Ok(dashboard);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var dashboard = await _dashboardService.GetAdminDashboardAsync();
            return Ok(dashboard);
        }
    }
}

