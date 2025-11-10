using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace HitsterFunction
{
    public class KeepAliveFunction
    {
        private readonly ILogger<KeepAliveFunction> _logger;
        private static readonly HttpClient _httpClient = new HttpClient();

        public KeepAliveFunction(ILogger<KeepAliveFunction> logger)
        {
            _logger = logger;
        }

        // Runs every 5 minutes to keep the function app warm
        [Function("KeepAlive")]
        public async Task Run([TimerTrigger("0 */5 * * * *")] TimerInfo timerInfo)
        {
            _logger.LogInformation($"KeepAlive function executed at: {DateTime.Now}");
            _logger.LogInformation($"Next timer schedule at: {timerInfo.ScheduleStatus?.Next}");

            try
            {
                // Get the base URL from environment variable or use localhost for local testing
                var baseUrl = Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME");
                if (string.IsNullOrEmpty(baseUrl))
                {
                    baseUrl = "localhost:7071"; // Default for local development
                }

                var targetUrl = $"http://{baseUrl}/api/MusicPlayer";
                _logger.LogInformation($"Pinging MusicPlayer function at: {targetUrl}");

                var response = await _httpClient.GetAsync(targetUrl);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Successfully pinged MusicPlayer function. Status: {response.StatusCode}");
                }
                else
                {
                    _logger.LogWarning($"MusicPlayer ping returned non-success status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pinging MusicPlayer function");
            }
        }
    }
}
