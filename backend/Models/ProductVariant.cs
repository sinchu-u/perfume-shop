using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class ProductVariant
    {
        public int Id { get; set; }
        public int VolumeMl { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
    }
}