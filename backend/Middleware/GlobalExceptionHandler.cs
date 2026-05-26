using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;
        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Сталася помилка на маршруті: {Path}", httpContext.Request.Path);

            var (statusCode, title) = exception switch
            {   
                UnauthorizedAccessException => (HttpStatusCode.Forbidden, exception.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
                KeyNotFoundException => (HttpStatusCode.NotFound, exception.Message),
                DbUpdateException => (HttpStatusCode.Conflict, "Не вдалося видалити елемент: елемент підв'язаний до товару."),
                _ => (HttpStatusCode.InternalServerError, "Внутрішня помилка сервера. Спробуйте пізніше.")
            };

            var problemDetails = new ProblemDetails
            {
                Status = (int)statusCode,
                Title = title
            };

            httpContext.Response.StatusCode = problemDetails.Status!.Value;
            httpContext.Response.ContentType = "application/json";

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}
