

namespace Backend.DTOs
{
    public class RegisterDto
    {
        public string Name { get; set; } = String.Empty;
        public string Email { get; set; } = String.Empty;
        public string Password { get; set; } = String.Empty;
        public string Role { get; set; } = String.Empty; // Admin, Manager, Tenant
        public int? TenantId { get; set; } // Null for Admin/Manager
    }
}