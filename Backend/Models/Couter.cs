

namespace Backend.Models
{
    public class Counter
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
        public int LastValue { get; set; }
    }
}