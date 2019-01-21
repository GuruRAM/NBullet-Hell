using nbullet_hell_server.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;

namespace nbullet_hell_server.Services
{
    public class PlayerService
    {
        private object sync = new object();
        private const string PlayerFolder = "players";

        public PlayerService()
        {
            if (!Directory.Exists(PlayerFolder))
            {
                Directory.CreateDirectory(PlayerFolder);
            }
        }


        private string GetPlayerPath(string name)
        {
            return Path.Combine(PlayerFolder, name);
        }

        private void CheckPlayer(string name, string path)
        {
            if (!File.Exists(path))
            {
                throw new ArgumentException($"User {name} doesn't exist");
            }
        }

        public Player GetPlayer(string name)
        {
            var path = GetPlayerPath(name);
            CheckPlayer(name, path);
            lock (sync)
            {
                return JsonConvert.DeserializeObject<Player>(File.ReadAllText(path));
            }
        }

        public void AddPlayer(string name)
        {
            var path = GetPlayerPath(name);
            if (!File.Exists(path))
            {
                var player = new Player()
                {
                    History = new List<Game>(),
                    Name = name,
                    RegistrationTime = DateTime.Now
                };

                lock (sync)
                {
                    File.WriteAllText(path, JsonConvert.SerializeObject(player));
                }
            }
        }
        
        public void DeletePlayer(string name)
        {
            var path = GetPlayerPath(name);
            CheckPlayer(name, path);
            lock (sync)
            {
                File.Delete(path);
            }
        }

        public void AddGame(string name, Game game)
        {
            var path = GetPlayerPath(name);
            CheckPlayer(name, path);

            lock (sync)
            {
                var player = JsonConvert.DeserializeObject<Player>(File.ReadAllText(path));
                player.History.Add(game);
                File.WriteAllText(path, JsonConvert.SerializeObject(player));
            }
        }
    }
}
