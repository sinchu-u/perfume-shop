using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.CommentDTOs
{
    public class UpdateCommentDTO
    {
        [Required]
        [Range (1, 5, ErrorMessage = "Поставте оцінку від 1 до 5.")]
        public int Rating { get; set; }
        [MaxLength(300, ErrorMessage = "Вміст не може бути більшим за 300 символів.")]
        public string Text { get; set; } = string.Empty;
    }
}