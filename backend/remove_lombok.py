import os
import re

directories = [
    r"c:\VS Code\MCA\FleetPro\backend\src\main\java\com\fms\model",
    r"c:\VS Code\MCA\FleetPro\backend\src\main\java\com\fms\dto"
]

def generate_getters_setters(fields):
    methods = []
    for f_type, f_name in fields:
        capitalized = f_name[0].upper() + f_name[1:]
        methods.append(f"    public {f_type} get{capitalized}() {{\n        return {f_name};\n    }}\n")
        methods.append(f"    public void set{capitalized}({f_type} {f_name}) {{\n        this.{f_name} = {f_name};\n    }}\n")
    return "\n".join(methods)

def generate_all_args_constructor(class_name, fields):
    if not fields:
        return ""
    args = ", ".join([f"{f_type} {f_name}" for f_type, f_name in fields])
    assignments = "\n".join([f"        this.{f_name} = {f_name};" for f_type, f_name in fields])
    return f"    public {class_name}({args}) {{\n{assignments}\n    }}\n"

def generate_no_args_constructor(class_name):
    return f"    public {class_name}() {{}}\n"

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith(".java"):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if "lombok" in content:
                # Check for specific annotations before removing
                had_all_args = "@AllArgsConstructor" in content
                had_no_args = "@NoArgsConstructor" in content
                
                # Remove lombok imports
                content = re.sub(r'^import lombok\..*;\n', '', content, flags=re.MULTILINE)
                content = re.sub(r'^\s*@Data\s*\n', '', content, flags=re.MULTILINE)
                content = re.sub(r'^\s*@AllArgsConstructor\s*\n', '', content, flags=re.MULTILINE)
                content = re.sub(r'^\s*@NoArgsConstructor\s*\n', '', content, flags=re.MULTILINE)
                
                # Extract class name
                class_match = re.search(r'public\s+class\s+([A-Za-z0-9_]+)', content)
                if not class_match:
                    continue
                class_name = class_match.group(1)

                # Extract fields
                fields = re.findall(r'private\s+([A-Za-z0-9_<>,]+)\s+([A-Za-z0-9_]+)\s*;', content)
                
                getters_setters = generate_getters_setters(fields)
                
                constructors = ""
                # Also add default constructor if we add an all args constructor (since @Data implies required args constructor, usually default if no final fields)
                # Just add default constructor to be safe, JPA requires it.
                constructors += generate_no_args_constructor(class_name)
                
                if had_all_args:
                    constructors += generate_all_args_constructor(class_name, fields)
                
                # Insert before the last closing brace
                last_brace_idx = content.rfind('}')
                if last_brace_idx != -1 and fields:
                    content = content[:last_brace_idx] + "\n" + constructors + "\n" + getters_setters + "\n}\n"
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Processed {filename}")
