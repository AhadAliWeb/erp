

namespace Backend.Models
{
    public class ProductionSlip
    {
        public int Id { get; set; }
        public int TenantId { get; set; } // FK to Tenant

        public Tenant Tenant { get; set; } = null!;// Navigation property

        public int SlipNumber { get; set; }
        public decimal Weight { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}