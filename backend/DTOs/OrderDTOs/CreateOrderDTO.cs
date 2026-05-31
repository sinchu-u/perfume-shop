using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.OrderDTOs
{
    public class CreateOrderDTO
    {
        [Required(ErrorMessage = "Заповніть поле з іменем.")]
        public string Name { get; set; } = string.Empty;
        [Required(ErrorMessage = "Заповніть поле з прізвищем.")]
        public string Surname { get; set; } = string.Empty;
        [Required(ErrorMessage = "Заповніть поле з по-батькові.")]
        public string Patronimic { get; set; } = string.Empty;
        [Required(ErrorMessage = "Заповніть поле з номером телефону.")]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required(ErrorMessage = "Заповніть поле з електронною поштою.")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Заповніть поле з адресою.")]
        public string Address { get; set; } = string.Empty;
    }
}