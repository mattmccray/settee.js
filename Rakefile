require 'rubygems'
require "bundler/setup"
require 'gumdrop'

# For the SYNC task
USER='user'
SERVER='server.com'
FOLDER="~/#{SERVER}"

# Build folder (change if you change Gumdrop.config.output_dir)
OUTPUT="output/"

desc "Build source files into output_dir"
task :build do
  system("bundle exec gumdrop -b")
end

desc "Run development server"
task :serve do
  system("bundle exec gumdrop -s")
end

desc "Syncs with public server using rsync (if configured)"
task :sync do
  cmd= "rsync -avz --delete #{OUTPUT} #{USER}@#{SERVER}:#{FOLDER}"
  puts "Running:\n#{cmd}\n"
  system(cmd)
  puts "Done."
end

desc "Outputs the Gumdrop version"
task :version do
  puts Gumdrop::VERSION
end

task :default do
  puts `rake -T`
end