from pathlib import Path
import re
path = Path("src/app/messages/page.tsx")
text = path.read_text(encoding="utf-8")
pattern = r"<div className=\\\"flex items-center gap-3\\\">[\\s\\S]*?<div className=\\\"flex w-full max-w-md"
new = """<div className=\"flex items-center gap-3\">\n              <Button\n                variant=\"outline\"\n                className=\"rounded-full\"\n                onClick={() => {\n                  if (typeof window !== \"undefined\") {\n                    window.localStorage.setItem(\"messagesActiveRole\", role === \"host\" ? \"client\" : \"host\")\n                  }\n                  if (role === \"host\") {\n                    setRole(\"client\")\n                    router.push(\"/messages\")\n                  } else {\n                    router.push(\"/host/verify?next=\" + encodeURIComponent(\"/messages\"))\n                  }\n                }}\n              >\n                {role === \"host\" ? \"Client inbox\" : \"Host inbox\"}\n                {role === \"host\" ? \"\" : hostThreadCount > 0 ? \" (\" + hostThreadCount + \")\" : \"\"}\n              </Button>\n              <div className=\"flex w-full max-w-md"""
new_text = re.sub(pattern, new, text, count=1)
if new_text != text:
    path.write_text(new_text, encoding="utf-8")
    print("ok")
