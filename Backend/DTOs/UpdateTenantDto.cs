
namespace Backend.DTOs
{
    public class UpdateTenantDto
    {
        public string Company { get; set; } = String.Empty;
        public string Address { get; set; } = String.Empty;
        public string ContactPerson { get; set; } = String.Empty;
        public string ContactNumber { get; set; } = String.Empty;
    }
}