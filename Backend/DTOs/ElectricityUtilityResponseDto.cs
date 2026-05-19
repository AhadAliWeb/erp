namespace Backend.DTOs
{
    public class ElectricityUtilityResponseDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string CompanyName { get; set; } = String.Empty;
        public string BillingMonth { get; set; } = String.Empty;
        public decimal PreviousReading { get; set; }
        public decimal CurrentReading { get; set; }
        public decimal UnitsConsumed { get; set; }
        public decimal RatePerUnit { get; set; }
        public decimal ElectricityCharges { get; set; }
        public decimal FixedCharges { get; set; }
        public decimal SSTCharges { get; set; }
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