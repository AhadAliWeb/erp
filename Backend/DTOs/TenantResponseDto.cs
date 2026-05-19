// TenantResponseDto.cs
// Id — int
// Company — string
// Address — string
// Category — string
// ContactPerson — string
// ContactNumber — string
// MonthlyRent — decimal
// IncrementPercentage — decimal
// AgreementDate — DateTime
// EndDate — DateTime
// ElectricityOutstanding — decimal
// WaterOutstanding — decimal
// RentOutstanding — decimal
// Status — string
// CreatedAt — DateTime

namespace Backend.DTOs
{
    public class TenantResponseDto
    {
        public int Id { get; set; }
        public string Company { get; set; } = String.Empty;
        public string Address { get; set; } = String.Empty;
        public string Category { get; set; } = String.Empty;
        public string ContactPerson { get; set; } = String.Empty;
        public string ContactNumber { get; set; } = String.Empty;
        public decimal MonthlyRent { get; set; }
        public decimal IncrementPercentage { get; set; }
        public DateTime AgreementDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal ElectricityOutstanding { get; set; }
        public decimal WaterOutstanding { get; set; }
        public decimal RentOutstanding { get; set; }
        public string Status { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; }
    }
}