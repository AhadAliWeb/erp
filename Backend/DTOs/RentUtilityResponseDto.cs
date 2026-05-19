
namespace Backend.DTOs
{
    public class RentUtilityResponseDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string CompanyName { get; set; } = String.Empty;
        public string BillingMonth { get; set; } = String.Empty;
        public decimal RentAmount { get; set; }
        public decimal Arrears { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime IssueDate { get; set; }
        public bool IsObsolete { get; set; } = false;
        public bool OverdueAmountAdded { get; set; } = false;

        public string Status { get; set; } = "Unpaid"; // New property to track payment status
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}