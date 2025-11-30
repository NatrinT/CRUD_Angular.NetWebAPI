namespace backend.Models
{
    public class PaginationRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string OrderField { get; set; } = "Id";
        public string OrderDirection { get; set; } = "asc";
        public string Search { get; set; } = string.Empty;
    }

    public class PagedResult<T>
    {
        public List<T> DataSource { get; set; } = new List<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }

        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
