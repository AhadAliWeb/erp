

namespace Backend.Models
{
    public class ProductionVoucher
    {
        public int Id { get; set; }
        public int TenantId { get; set; } // FK to Tenant
        public int ProductionCommissionId { get; set; } // FK to ProductionCommission

        public Tenant Tenant { get; set; } = null!;// Navigation property
        public ProductionCommission ProductionCommission { get; set; } = null!;// Navigation property

        public decimal TotalAmount { get; set; }
        public string ModeOfPayment { get; set; } = String.Empty;
        public string? ChequeNo { get; set; }
        public string? PayOrderNo { get; set; }
        public int? BankId { get; set; } // FK to Bank
        public Bank? Bank { get; set; } // Navigation property
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}