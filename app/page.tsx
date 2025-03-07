"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Copy, Download, Upload, Trash2, Play, FileJson, FileCode, Moon, Sun, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function JsonToXmlConverter() {
  const [jsonInput, setJsonInput] = useState("")
  const [xmlOutput, setXmlOutput] = useState("")
  const [rootElement, setRootElement] = useState("root")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isFormatted, setIsFormatted] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample JSON examples
  const examples = {
    simple: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}`,
    nested: `{
  "person": {
    "name": "Jane Smith",
    "details": {
      "age": 28,
      "occupation": "Developer"
    },
    "hobbies": ["reading", "hiking", "coding"]
  }
}`,
    array: `{
  "employees": [
    {
      "id": 1,
      "name": "Alice",
      "department": "Engineering"
    },
    {
      "id": 2,
      "name": "Bob",
      "department": "Marketing"
    }
  ]
}`,
  }

  // Recursive function to convert JSON to XML
  const jsonToXml = (json: any, nodeName: string): string => {
    let xml = ""
    if (Array.isArray(json)) {
      for (let i = 0; i < json.length; i++) {
        xml += jsonToXml(json[i], nodeName)
      }
    } else if (typeof json === "object" && json !== null) {
      if (nodeName) {
        xml += `<${nodeName}>`
      }
      for (const key in json) {
        if (Object.prototype.hasOwnProperty.call(json, key)) {
          xml += jsonToXml(json[key], key)
        }
      }
      if (nodeName) {
        xml += `</${nodeName}>`
      }
    } else {
      if (nodeName) {
        // Escape special characters in XML content
        const escapedContent = String(json)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;")
        xml += `<${nodeName}>${escapedContent}</${nodeName}>`
      } else {
        xml += json
      }
    }
    return xml
  }

  // Function to format XML string with indentation
  const formatXml = (xml: string): string => {
    let formatted = ""
    const reg = /(>)(<)(\/*)/g
    xml = xml.replace(reg, "$1\n$2$3")
    let pad = 0
    xml.split("\n").forEach((node) => {
      let indent = 0
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1
        }
      } else if (node.match(/^<\w[^>]*[^/]>.*$/)) {
        indent = 1
      } else {
        indent = 0
      }

      const padding = "  ".repeat(pad)
      formatted += padding + node + "\n"
      pad += indent
    })
    return formatted.trim()
  }

  const convertJsonToXml = () => {
    setError("")
    setSuccess("")
    setXmlOutput("")

    if (!jsonInput.trim()) {
      setError("Please enter JSON data to convert")
      return
    }

    try {
      const jsonObj = JSON.parse(jsonInput)
      const rawXml = jsonToXml(jsonObj, rootElement)
      // Include the XML declaration
      const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" ?>\n'
      const xmlResult = isFormatted ? xmlDeclaration + formatXml(rawXml) : xmlDeclaration + rawXml

      setXmlOutput(xmlResult)
      setSuccess("JSON successfully converted to XML")
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const copyToClipboard = () => {
    if (!xmlOutput) {
      setError("No XML to copy")
      return
    }

    navigator.clipboard
      .writeText(xmlOutput)
      .then(() => {
        setSuccess("XML copied to clipboard")
        setTimeout(() => setSuccess(""), 3000)
      })
      .catch(() => {
        setError("Failed to copy to clipboard")
      })
  }

  const downloadXml = () => {
    if (!xmlOutput) {
      setError("No XML to download")
      return
    }

    const blob = new Blob([xmlOutput], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "converted.xml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSuccess("XML file downloaded")
  }

  const clearAll = () => {
    setJsonInput("")
    setXmlOutput("")
    setError("")
    setSuccess("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonInput(content)
      setSuccess("JSON file loaded successfully")
    }
    reader.onerror = () => {
      setError("Error reading file")
    }
    reader.readAsText(file)
  }

  const loadExample = (exampleKey: keyof typeof examples) => {
    setJsonInput(examples[exampleKey])
    setSuccess(`Example loaded: ${exampleKey}`)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileJson className="h-6 w-6" /> JSON to XML Converter
            </h1>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleDarkMode}
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle {isDarkMode ? "Light" : "Dark"} Mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About JSON to XML Converter</DialogTitle>
                    <DialogDescription>
                      This tool converts JSON data to XML format. You can:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Enter JSON manually or upload a JSON file</li>
                        <li>Customize the root element name</li>
                        <li>Choose between formatted or minified XML output</li>
                        <li>Copy the result to clipboard or download as a file</li>
                        <li>Use sample examples to get started quickly</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileJson className="h-5 w-5" /> JSON Input
                </h2>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Load Example
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Choose an Example</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Button onClick={() => loadExample("simple")}>Simple Object</Button>
                        <Button onClick={() => loadExample("nested")}>Nested Object</Button>
                        <Button onClick={() => loadExample("array")}>Array of Objects</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload JSON File</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleFileUpload} />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={clearAll}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear All</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Enter your JSON here..."
                className="font-mono h-[300px] resize-none"
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rootElement">Root Element Name</Label>
                  <Input
                    id="rootElement"
                    value={rootElement}
                    onChange={(e) => setRootElement(e.target.value)}
                    placeholder="root"
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch id="format-switch" checked={isFormatted} onCheckedChange={setIsFormatted} />
                    <Label htmlFor="format-switch">Format XML Output</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={convertJsonToXml}>
                <Play className="mr-2 h-4 w-4" /> Convert to XML
              </Button>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileCode className="h-5 w-5" /> XML Output
                </h2>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!xmlOutput}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to Clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={downloadXml} disabled={!xmlOutput}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download XML</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div
                className={`font-mono bg-muted p-4 rounded-md h-[300px] overflow-auto whitespace-pre ${
                  !xmlOutput ? "flex items-center justify-center text-muted-foreground" : ""
                }`}
              >
                {xmlOutput || "XML output will appear here"}
              </div>
            </Card>
          </div>
        </main>

        <footer className="mt-8 py-4 border-t text-center text-sm text-muted-foreground">
          <div className="container mx-auto">
            JSON to XML Converter - A powerful tool for converting JSON data to XML format
          </div>
        </footer>
      </div>
    </div>
  )
}

