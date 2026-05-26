using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class ProductQueryObject
    {
        public string? Search { get; set; } = null;
        public string? Brand { get; set; } = null;
        public string? Category { get; set; } = null;
        public string? ScentType { get; set; } = null;
        public List<int> Volumes { get; set; } = new List<int>();
        public string? SortBy { get; set; } = null;
        public bool IsDescending { get; set; } = false;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}