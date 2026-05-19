


namespace Backend.DTOs
{
    public class PagedResultDto<T>
    {
        public List<T> Data { get; set; } = new List<T>();

        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
    }
}