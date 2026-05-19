// Billing Month
// Units Consumed
// Total Amount
// Issue Date
// Due Date
// Status


namespace Backend.DTOs
{
    public class AllBillsResponseDto
    {
        public int Id { get; set; }
        public string BillingMonth { get; set; } = String.Empty;

        // public int? MonthlyRent { get; set; } 
        public decimal? UnitsConsumed { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = String.Empty;
    }
}
