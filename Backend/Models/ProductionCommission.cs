

namespace Backend.Models
{
    public class ProductionCommission
    {
        public int Id { get; set; }
        public int TenantId { get; set; } // FK to Tenant

        public Tenant Tenant { get; set; } = null!;// Navigation property

        public int SlipFrom { get; set; }
        public int SlipTo { get; set; }
        public decimal TotalWeight { get; set; }
        public decimal RatePerKg { get; set; }
        public decimal TotalAmount { get; set; }
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}