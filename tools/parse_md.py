import os
import markdown

count = 0;
in_section = None
section = ''

def flush():
    if in_section:
        f.write("{ topic: `" + in_section.strip("# :\n") + "`,\n")
        f.write(" text: `" + markdown.markdown(section.rstrip("\n ").replace('"public/', '"')) + "`},\n")

f = open("../readme.md")
contents = f.readlines()
f.close()

f = open("../src/lib/help.js", "w")
f.write("export const help_data = [\n")

for line in contents:
    count = count + 1
    if line.lstrip().startswith("# "):
        flush();
        in_section = None
    elif line.lstrip().startswith("## "):
        flush();
        in_section = line
        section = line
    else:
        section = section + line
flush();

f.write("]\nexport default help_data;\n")
f.close();
