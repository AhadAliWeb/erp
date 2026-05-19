

namespace Backend.DTOs
{
    public class CreateWaterUtilityDto
    {
        public int TenantId { get; set; }
        public string BillingMonth { get; set; } = String.Empty;
        public decimal PreviousReading { get; set; }
        public decimal CurrentReading { get; set; }
        public DateTime DueDate { get; set; }
    }
}

