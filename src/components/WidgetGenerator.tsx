import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Settings, Code, Palette, Zap, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface WidgetGeneratorProps {
  tenantId?: string;
  apiKey?: string;
}

const WidgetGenerator: React.FC<WidgetGeneratorProps> = ({
  tenantId = "demo-tenant-123",
  apiKey = "axient-widget-key-abc123",
}) => {
  const [activeTab, setActiveTab] = useState("appearance");
  const [copied, setCopied] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({
    appearance: {
      primaryColor: "#6366f1",
      secondaryColor: "#f9fafb",
      borderRadius: 8,
      position: "bottom-right",
      width: 380,
      height: 600,
      iconStyle: "chat",
    },
    capabilities: {
      enableFiles: true,
      enableVoice: true,
      enableHistory: true,
      enableModules: ["crm", "orders", "support"],
      welcomeMessage:
        "Hello! I'm your AxientOS assistant. How can I help you today?",
    },
  });

  const handleAppearanceChange = (field: string, value: any) => {
    setWidgetConfig({
      ...widgetConfig,
      appearance: {
        ...widgetConfig.appearance,
        [field]: value,
      },
    });
  };

  const handleCapabilitiesChange = (field: string, value: any) => {
    setWidgetConfig({
      ...widgetConfig,
      capabilities: {
        ...widgetConfig.capabilities,
        [field]: value,
      },
    });
  };

  const handleModuleToggle = (module: string) => {
    const currentModules = [...widgetConfig.capabilities.enableModules];
    const index = currentModules.indexOf(module);

    if (index > -1) {
      currentModules.splice(index, 1);
    } else {
      currentModules.push(module);
    }

    handleCapabilitiesChange("enableModules", currentModules);
  };

  const generateEmbedCode = () => {
    return `<!-- AxientOS Widget -->
<script>
  window.AxientConfig = {
    tenantId: "${tenantId}",
    apiKey: "${apiKey}",
    appearance: ${JSON.stringify(widgetConfig.appearance, null, 4)},
    capabilities: ${JSON.stringify(widgetConfig.capabilities, null, 4)}
  };
</script>
<script async src="https://widget.axientos.com/loader.js"></script>
<!-- End AxientOS Widget -->`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background p-6 rounded-xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Widget Generator</h1>
        <p className="text-muted-foreground">
          Customize and generate an embeddable AI assistant widget for your
          business platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="capabilities"
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Capabilities
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Embed Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Customization</CardTitle>
                  <CardDescription>
                    Customize how your widget looks and where it appears on your
                    website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{
                              backgroundColor:
                                widgetConfig.appearance.primaryColor,
                            }}
                          />
                          <Input
                            id="primaryColor"
                            value={widgetConfig.appearance.primaryColor}
                            onChange={(e) =>
                              handleAppearanceChange(
                                "primaryColor",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{
                              backgroundColor:
                                widgetConfig.appearance.secondaryColor,
                            }}
                          />
                          <Input
                            id="secondaryColor"
                            value={widgetConfig.appearance.secondaryColor}
                            onChange={(e) =>
                              handleAppearanceChange(
                                "secondaryColor",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="borderRadius">
                          Border Radius ({widgetConfig.appearance.borderRadius}
                          px)
                        </Label>
                        <Slider
                          id="borderRadius"
                          min={0}
                          max={20}
                          step={1}
                          value={[widgetConfig.appearance.borderRadius]}
                          onValueChange={(value) =>
                            handleAppearanceChange("borderRadius", value[0])
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="position">Widget Position</Label>
                        <Select
                          value={widgetConfig.appearance.position}
                          onValueChange={(value) =>
                            handleAppearanceChange("position", value)
                          }
                        >
                          <SelectTrigger id="position" className="mt-1">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">
                              Bottom Right
                            </SelectItem>
                            <SelectItem value="bottom-left">
                              Bottom Left
                            </SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="iconStyle">Icon Style</Label>
                        <Select
                          value={widgetConfig.appearance.iconStyle}
                          onValueChange={(value) =>
                            handleAppearanceChange("iconStyle", value)
                          }
                        >
                          <SelectTrigger id="iconStyle" className="mt-1">
                            <SelectValue placeholder="Select icon style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chat">Chat Bubble</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                            <SelectItem value="robot">Robot</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="width">
                            Width ({widgetConfig.appearance.width}px)
                          </Label>
                          <Input
                            id="width"
                            type="number"
                            min={300}
                            max={600}
                            value={widgetConfig.appearance.width}
                            onChange={(e) =>
                              handleAppearanceChange(
                                "width",
                                parseInt(e.target.value),
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">
                            Height ({widgetConfig.appearance.height}px)
                          </Label>
                          <Input
                            id="height"
                            type="number"
                            min={400}
                            max={800}
                            value={widgetConfig.appearance.height}
                            onChange={(e) =>
                              handleAppearanceChange(
                                "height",
                                parseInt(e.target.value),
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Capabilities</CardTitle>
                  <CardDescription>
                    Configure what your AI assistant widget can do and access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableFiles">File Upload</Label>
                        <Switch
                          id="enableFiles"
                          checked={widgetConfig.capabilities.enableFiles}
                          onCheckedChange={(checked) =>
                            handleCapabilitiesChange("enableFiles", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableVoice">Voice Input</Label>
                        <Switch
                          id="enableVoice"
                          checked={widgetConfig.capabilities.enableVoice}
                          onCheckedChange={(checked) =>
                            handleCapabilitiesChange("enableVoice", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableHistory">
                          Conversation History
                        </Label>
                        <Switch
                          id="enableHistory"
                          checked={widgetConfig.capabilities.enableHistory}
                          onCheckedChange={(checked) =>
                            handleCapabilitiesChange("enableHistory", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Enabled Modules</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "crm",
                          "hr",
                          "finance",
                          "orders",
                          "support",
                          "legal",
                        ].map((module) => (
                          <div
                            key={module}
                            className="flex items-center space-x-2"
                          >
                            <Switch
                              id={`module-${module}`}
                              checked={widgetConfig.capabilities.enableModules.includes(
                                module,
                              )}
                              onCheckedChange={() => handleModuleToggle(module)}
                            />
                            <Label
                              htmlFor={`module-${module}`}
                              className="capitalize"
                            >
                              {module}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={widgetConfig.capabilities.welcomeMessage}
                      onChange={(e) =>
                        handleCapabilitiesChange(
                          "welcomeMessage",
                          e.target.value,
                        )
                      }
                      placeholder="Enter a welcome message for your widget"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>
                    Copy this code and paste it into your website to add the AI
                    assistant widget.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      value={generateEmbedCode()}
                      readOnly
                      className="font-mono text-sm h-64 overflow-auto"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Add this code to the &lt;body&gt; section of your HTML. The
                    widget will automatically initialize when your page loads.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Widget Preview
              </CardTitle>
              <CardDescription>
                Live preview of your widget configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg h-[400px] overflow-hidden">
                <div className="absolute bottom-0 right-0 m-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{
                      backgroundColor: widgetConfig.appearance.primaryColor,
                      borderRadius: `${widgetConfig.appearance.borderRadius}px`,
                    }}
                    className="w-12 h-12 flex items-center justify-center text-white cursor-pointer shadow-lg"
                  >
                    {widgetConfig.appearance.iconStyle === "chat" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )}
                    {widgetConfig.appearance.iconStyle === "assistant" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    )}
                    {widgetConfig.appearance.iconStyle === "robot" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                        <circle cx="12" cy="5" r="2"></circle>
                        <path d="M12 7v4"></path>
                        <line x1="8" y1="16" x2="8" y2="16"></line>
                        <line x1="16" y1="16" x2="16" y2="16"></line>
                      </svg>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 400 }}
                  animate={{ y: 100 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  style={{
                    width: `${Math.min(widgetConfig.appearance.width, 320)}px`,
                    height: `${Math.min(widgetConfig.appearance.height, 400)}px`,
                    borderRadius: `${widgetConfig.appearance.borderRadius}px`,
                    backgroundColor: widgetConfig.appearance.secondaryColor,
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                  }}
                  className="shadow-xl border overflow-hidden"
                >
                  <div
                    style={{
                      backgroundColor: widgetConfig.appearance.primaryColor,
                    }}
                    className="p-3 text-white font-medium"
                  >
                    AxientOS Assistant
                  </div>
                  <div className="p-4 text-sm">
                    <div className="bg-gray-100 rounded-lg p-3 mb-2 max-w-[80%]">
                      {widgetConfig.capabilities.welcomeMessage}
                    </div>
                    <div className="flex justify-end">
                      <div
                        style={{
                          backgroundColor:
                            widgetConfig.appearance.primaryColor + "20",
                        }}
                        className="rounded-lg p-3 mb-2 max-w-[80%] text-right"
                      >
                        How can I help you today?
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 border-t p-2 flex gap-2 bg-white">
                    <Input
                      placeholder="Type your message..."
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: widgetConfig.appearance.primaryColor,
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;
