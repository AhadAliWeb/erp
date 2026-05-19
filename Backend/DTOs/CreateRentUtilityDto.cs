

namespace Backend.DTOs
{
    public class CreateRentUtilityDto
    {
        public int TenantId { get; set; }
        public string BillingMonth { get; set; } = String.Empty;
        // public decimal Arrears { get; set; }
        public DateTime DueDate { get; set; }
    }
}