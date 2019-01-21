using System;
using System.Collections.Generic;

namespace nbullet_hell_server.Models
{
    public class Player
    {
        public string Name { get; set; }
        public List<Game> History { get; set; }
        public DateTime RegistrationTime { get; set; }
    }
}
