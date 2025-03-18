//Generating Gemini Response
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
const getDataFromGemini = (file, fileType) => {
  const generativeAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GOOGLE_API_KEY,
  );

  const schema = {
    description: "Details present in the invoice",
    type: SchemaType.OBJECT,
    properties: {
      invoice_id: {
        type: SchemaType.STRING,
        description: "Unique identifier for the invoice",
      },
      invoice_date: {
        type: SchemaType.STRING,
        format: "date-time",
        description: "Date of the invoice",
      },
      vendor_name: {
        type: SchemaType.STRING,
        description: "Name of the vendor",
      },
      owner_name: {
        type: SchemaType.STRING,
        description: "Bill to Company Name",
      },
      total_amount: {
        type: SchemaType.NUMBER,
        description: "Total amount for the invoice",
      },
      invoice_type: {
        type: SchemaType.STRING,
        enum: ["lease", "own"],
        description:
          "If the Owner is DarwinBox give value as own otherwise lease",
      },
      invoice_description: {
        type: SchemaType.STRING,
        description: "Description of the items that are inside of the invoice.",
      },
      assets: {
        type: SchemaType.ARRAY,
        description: "List of assets in the invoice",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            serial_no: {
              type: SchemaType.STRING,
              description: "Unique serial number of the asset",
            },
            category: {
              type: SchemaType.STRING,
              enum: [
                "laptop",
                "desktop",
                "server",
                "printer",
                "monitor",
                "mouse",
                "keyboard",
              ],
              description: "Category of the asset",
            },
            make: {
              type: SchemaType.STRING,
              enum: [
                "Lenovo",
                "Mac",
                "Dell",
                "HP",
                "Logitech",
                "Samsung",
                "LG",
                "Epson",
              ],
              description: "Manufacturer of the asset",
            },
            model: {
              type: SchemaType.STRING,
              enum: [
                // Lenovo models
                "ThinkPad",
                "IdeaPad",
                "Legion",
                "Yoga",
                "ThinkCentre",
                // Mac models
                "MacBook Pro",
                "MacBook Air",
                "iMac",
                "Mac Pro",
                "Mac Mini",
                // Dell models
                "Latitude",
                "Precision",
                "XPS",
                "Inspiron",
                "OptiPlex",
                // HP models
                "ProBook",
                "EliteBook",
                "Pavilion",
                "Envy",
                "Spectre",
                // Logitech models
                "MX Master",
                "M185",
                "K380",
                "MX Keys",
                "G Pro",
                // Samsung models
                "Odyssey",
                "ViewFinity",
                "Smart Monitor",
                "C24",
                "C27",
                // LG models
                "UltraGear",
                "UltraFine",
                "UltraWide",
                "DualUp",
                "QHD",
                // Epson models
                "EcoTank",
                "WorkForce",
                "Expression",
                "SureColor",
                "LabelWorks",
              ],
              description: "Model of the asset",
            },
            ram: {
              type: SchemaType.STRING,
              enum: ["8gb", "16gb", "32gb", "64gb", "128gb"],
              description: "RAM capacity",
            },
            storage: {
              type: SchemaType.STRING,
              enum: ["256gb", "512gb", "1tb"],
              description: "Storage capacity",
            },
            processor: {
              type: SchemaType.STRING,
              enum: [
                // Intel processors
                "Intel i9-13900K",
                "Intel i9-12900K",
                "Intel i7-13700K",
                "Intel i7-12700K",
                "Intel i5-13600K",
                "Intel i5-12600K",
                "Intel i3-13100",
                "Intel i3-12100",

                // AMD Ryzen processors
                "Ryzen 9 7950X",
                "Ryzen 9 7900X",
                "Ryzen 7 7700X",
                "Ryzen 7 5800X",
                "Ryzen 5 7600X",
                "Ryzen 5 5600X",

                // Apple Silicon
                "M1",
                "M2",
                "M3",
                "M3 Ultra",
                "M3 Pro",
                "M3 Max",
                "M2 Ultra",
                "M2 Pro",
                "M2 Max",
                "M1 Ultra",
                "M1 Pro",
                "M1 Max",
              ],
              description: "Processor details",
            },
            os_type: {
              type: SchemaType.STRING,
              enum: ["ubuntu", "windows", "mac"],
              description: "Operating system type",
            },
            warranty: {
              type: SchemaType.STRING,
              enum: ["basic", "adp", "apple care"],
              description: "Warranty type",
            },
            warranty_period: {
              type: SchemaType.STRING,
              enum: ["1year", "2years", "3years", "4years"],
              description: "Warranty Period",
            },
            warranty_start_date: {
              type: SchemaType.STRING,
              format: "date-time",
              description: "Invoice date is the warranty start date",
            },
            cost: {
              type: SchemaType.NUMBER,
              description: "Cost of the individual item",
            },
          },
          required: ["serial_no", "category", "make", "warranty"],
        },
      },
      licenses: {
        type: SchemaType.ARRAY,
        description: "List of software licenses in the invoice",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            serial_no: {
              type: SchemaType.STRING,
              description: "Unique serial number of the license",
            },
            category: {
              type: SchemaType.STRING,
              enum: ["sophos", "grammarly", "microsoft", "adobe", "autodesk"],
              description: "Software category",
            },
            model: { type: SchemaType.STRING, description: "License model" },
            warranty: { type: SchemaType.STRING, description: "Warranty type" },
            cost: {
              type: SchemaType.NUMBER,
              description: "Cost of the individual item",
            },
            warranty_period: {
              type: SchemaType.STRING,
              enum: ["1year", "2years", "3years", "4years"],
              description: "Warranty Period",
            },
            warranty_start_date: {
              type: SchemaType.STRING,
              format: "date-time",
              description: "Invoice date is the warranty start date",
            },
          },

          required: ["serial_no", "category", "model", "warranty"],
        },
      },
    },
    required: [
      "invoice_id",
      "invoice_date",
      "vendor_name",
      "owner_name",
      "total_amount",
      "assets",
      "licenses",
      "invoice_description",
    ],
  };

  // Generation Configuration
  const generationConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 7000,
    responseMimeType: "application/json",
    responseSchema: schema,
  };

  // Initialize the model
  const model = generativeAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig,
  });

  // Generate content
  async function generateContent() {
    try {
      const mimeType = fileType;
      const fileBase64 = file.toString("base64");
      // console.log(mimeType);
      // Define parts
      const parts = [
        {
          text: `Extract all relevant details from the provided invoice and structure them into a 
                  JSON format strictly following the given schema. Ensure accurate mapping of serial numbers as an array, 
                  category, make, model, specifications (RAM, storage, processor, OS), and warranty details. 
                  Maintain consistency in formatting and include all required fields, even if values are missing.
                   Double-check numerical and date values for accuracy. Don't Include Number of years of warranty unless it is specifically mentioned in the Invoice,
                    but the name of the warranty can be specified. If Apple Care Plus is there then consider it as a apple care warranty with 3 years of warranty_period and don't add this into the license section again even though it has any serial numbers. The warranty_start date will be the invoice_date.
                    If item is a APPLE MAC BOOK give the os_type as 'mac'. If it is a laptop then only the ram, storage, processor,os_type fields should be present.
                    
                    `,
        },
        {
          inlineData: {
            mimeType,
            data: fileBase64,
          },
        },
      ];
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
      });

      const response = result.response;
      return response;
    } catch (error) {
      console.error("Error generating content: " + error);
    }
  }
  return generateContent();
};
export default getDataFromGemini;
