// FieldTypeIdstring (GUID)NamestringEmailstringPasswordHashstringRolestring (Admin, Manager, Tenant)TenantIdint? (null if Admin/Manager)IsActiveboolCreatedAtDateTime

namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
        public string Email { get; set; } = String.Empty;
        public string PasswordHash { get; set; } = String.Empty;
        public string Role { get; set; } = String.Empty; // Admin, Manager, Tenant
        public int?   TenantId { get; set; } // Null for Admin/Manager
        public bool    IsActive { get; set; } = true;
        public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
    }
}