// Id — int
// RentUtilityId — int (FK) → RentUtility.Id
// TenantId — int (FK) → Tenant.Id
// Amount — decimal
// ModeOfPayment — string (Cash, Cheque, PayOrder)
// ChequeNo — string?
// PayOrderNo — string?
// BankId — int? (FK) → Bank.Id
// PaymentDate — DateTime
// CreatedBy — string (FK) → ApplicationUser.Id
// CreatedAt — DateTime

namespace Backend.Models
{
    public class RentBill
    {
        public int Id { get; set; }
        public int RentUtilityId { get; set; } // FK to RentUtility
        public int TenantId { get; set; } // FK to Tenant

        public RentUtility RentUtility { get; set; } = null!;// Navigation property
        public Tenant Tenant { get; set; } = null!;// Navigation property

        public decimal Amount { get; set; }
        public string ModeOfPayment { get; set; } = String.Empty;
        public string? ChequeNo { get; set; }
        public string? PayOrderNo { get; set; }
        public int? BankId { get; set; } // FK to Bank
        public Bank? Bank { get; set; } // Navigation property
        public DateTime PaymentDate { get; set; }
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

