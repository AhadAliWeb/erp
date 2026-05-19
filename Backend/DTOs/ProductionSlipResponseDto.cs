

namespace Backend.DTOs
{
    public class ProductionSlipResponseDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string CompanyName { get; set; } = String.Empty;
        public int SlipNumber { get; set; }
        public decimal Weight { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
     }
}