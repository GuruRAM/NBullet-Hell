using Microsoft.AspNetCore.Mvc;
using nbullet_hell_server.Models;
using nbullet_hell_server.Services;
using System.ComponentModel.DataAnnotations;

namespace nbullet_hell_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayerController : ControllerBase
    {
        private const string namePattern = "^[a-zA-Z0-9]+$";
        private PlayerService playerService;

        public PlayerController(PlayerService playerService)
        {
            this.playerService = playerService;
        }

        [HttpPut("{name}")]
        public void Register([Required, RegularExpression(namePattern)] string name)
        {
            playerService.AddPlayer(name);
        }
        
        [HttpGet("{name}")]
        public ActionResult<Player> Get([Required, RegularExpression(namePattern)] string name)
        {
            return playerService.GetPlayer(name);
        }
        
        [HttpDelete("{name}")]
        public void Delete([Required, RegularExpression(namePattern)] string name)
        {
            playerService.DeletePlayer(name);
        }
    }
}
