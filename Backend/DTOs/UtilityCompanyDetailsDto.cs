


namespace Backend.DTOs
{
    public class UtilityCompanyDetailsDto
    {
        public int TenantId { get; set; }
        public string Company { get; set; } = null!;
        public string Address { get; set; } = null!;
        public decimal ElectricityPreviousReading { get; set; }

        public decimal MonthlyRent { get; set; }
        public decimal WaterPreviousReading { get; set; }
        public decimal? ElectricityOutstanding { get; set; }
        public decimal? WaterOutstanding { get; set; }
        public decimal? RentOutstanding { get; set; }
    }
}