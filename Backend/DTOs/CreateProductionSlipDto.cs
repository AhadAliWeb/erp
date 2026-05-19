

namespace Backend.DTOs
{
    public class CreateProductionSlipDto
    {
        public int TenantId { get; set; }
        public int SlipNumber { get; set; }
        public decimal Weight { get; set; }
    }
}