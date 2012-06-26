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

desc "Builds and tests settee.js"
task :test do
  system('bundle exec gumdrop -q -b')
  system('mocha')
  # system('open test/index.html')
end


# No desc cause it's dependent on my local project folders
task :update_doc_dir do
  dev_dir= File.expand_path './'
  doc_dir= File.expand_path '../settee-docs/'
  puts "Moving files from #{ dev_dir } to #{ doc_dir }"
  files= "settee.js settee.min.js ChangeLog.md ReadMe.md".split
  folders= "test bench lib".split
  files.each do |filename|
    puts " cp #{File.join(dev_dir, filename)} #{File.join(doc_dir, filename)}"
    FileUtils.cp File.join(dev_dir, filename), File.join(doc_dir, filename)
  end
  folders.each do |filename|
    puts " cp -r #{File.join(dev_dir, filename)} #{File.dirname(File.join(doc_dir, filename))}"
    FileUtils.cp_r File.join(dev_dir, filename), File.dirname(File.join(doc_dir, filename))
  end
end
task :update_docsite => :update_doc_dir do
  doc_dir= File.expand_path '../settee-docs/'
  system("cd #{doc_dir} && git ar .")
  system("cd #{doc_dir} && git commit -m 'Update settee.js, the tests and benchmarks.'")
  system("cd #{doc_dir} && git push")
end