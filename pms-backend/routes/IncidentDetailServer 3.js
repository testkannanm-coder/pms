import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Table, message, Modal, Button, Divider } from "antd";
import {
  FileTextOutlined,
  ContactsOutlined,
  UserOutlined,
  SolutionOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import "../styles/IncidentDetail.css";
import "antd/dist/reset.css";
import GradientCircularProgress from "./Spinner";
import Alert from "@mui/material/Alert";
import { decodeTiff, detectFileType } from "../utils/tiffUtils";

function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incidentData, setIncidentData] = useState(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState("");
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingIncident, setLoadingIncident] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [tiffPages, setTiffPages] = useState([]);
  const [tiffTotalPages, setTiffTotalPages] = useState(0);
  const [loadingTiff, setLoadingTiff] = useState(false);
  const [tiffError, setTiffError] = useState(null);

  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(
          `/AppealsAndGrievances/GetDetailsByIdFromQnxt/${encodeURIComponent(
            id
          )}`
        );
        setIncidentData(res.data || {});
      } catch (err) {
        console.error("Error fetching incident details:", err);
        message.error("Failed to fetch incident details.");
      } finally {
        setLoadingIncident(false);
      }
    };

    fetchIncidentDetails();
  }, [id]);

  useEffect(() => {
    const fetchInvoiceFiles = async () => {
      try {
        setLoadingFiles(true);
        const res = await api.get(
          `/AppealsAndGrievances/GetFileNameByIncidentId/${encodeURIComponent(
            id
          )}`
        );
        if (res.data && res.data.length > 0) {
          setInvoiceFiles(res.data);
        } else {
          setInvoiceFiles([]);
        }
      } catch (error) {
        console.error("Error fetching invoice files:", error);
        message.error("Failed to load invoice files");
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchInvoiceFiles();
  }, [id]);

  useEffect(() => {
    const fetchInvoiceFiles = async () => {
      try {
        setLoadingFiles(true);
        const res = await api.get(
          `/AppealsAndGrievances/GetFileNameByIncidentId/${encodeURIComponent(
            id
          )}`
        );

        if (Array.isArray(res.data)) {
          setInvoiceFiles(res.data);
        } else if (typeof res.data === "string" && res.data.trim() !== "") {
          setInvoiceFiles([res.data]);
        } else if (res.data && res.data.fileName) {
          setInvoiceFiles([res.data.fileName]);
        } else {
          setInvoiceFiles([]);
        }
      } catch (error) {
        console.error("Error fetching invoice files:", error);
        message.error("Failed to load invoice files");
        setInvoiceFiles([]);
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchInvoiceFiles();
  }, [id]);

  // Determine file type from filename/extension
  const getFileType = (fileName) => {
    if (!fileName) return "unknown";
    const extMatch = fileName.match(/\.([^.?#]+)(?:[?#].*)?$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "";
    if (ext === "pdf") return "pdf";
    if (ext === "tif" || ext === "tiff") return "tiff";
    if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext))
      return "image";
    return "unknown";
  };

  // Open preview modal for a file
  const handlePreviewOpen = async (fileName) => {
    const type = getFileType(fileName);

    setPreviewName(fileName);
    setPreviewType(type);
    setPreviewVisible(true);
    setTiffPages([]);
    setTiffTotalPages(0);
    setTiffError(null);
    setPreviewUrl("");

    try {
      // Fetch file from server
      const response = await api.get(
        `AppealsAndGrievances/DownloadInvoiceFile/${fileName}`,
        {
          responseType: "blob",
          validateStatus: () => true,
        }
      );

      if (response.status === 404) {
        setTiffError("The requested file was not found on the shared drive.");
        return;
      }

      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("text/plain")) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          if (text.includes("File not found")) {
            setTiffError(
              "The requested file was not found on the shared drive."
            );
          }
        };
        reader.readAsText(response.data);
        return;
      }

      if (response.status !== 200) {
        setTiffError("Failed to load file for preview");
        return;
      }

      let mimeType = "application/octet-stream";
      if (type === "pdf") {
        mimeType = "application/pdf";
      } else if (type === "image") {
        const ext = fileName.split(".").pop()?.toLowerCase();
        const imageMimeTypes = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          bmp: "image/bmp",
          webp: "image/webp",
        };
        mimeType = imageMimeTypes[ext] || "image/jpeg";
      } else if (type === "tiff") {
        mimeType = "image/tiff";
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Handle TIFF files
      if (type === "tiff") {
        setLoadingTiff(true);
        try {
          const arrayBuffer = await blob.arrayBuffer();

          const detectedType = detectFileType(arrayBuffer);

          if (detectedType !== "tiff") {
            setTiffError(
              `File appears to be ${detectedType.toUpperCase()}, not TIFF. Please check the file.`
            );
            setLoadingTiff(false);
            return;
          }

          const { pages, totalPages } = await decodeTiff(arrayBuffer, 5);

          if (pages && pages.length > 0) {
            setTiffPages(pages);
            setTiffTotalPages(totalPages);
          } else {
            setTiffError("No pages could be decoded from TIFF file");
          }
          setLoadingTiff(false);
        } catch (error) {
          setTiffError(error.message || "Failed to load TIFF file");
          setLoadingTiff(false);
        }
      }
    } catch (error) {
      setTiffError("Failed to load file for preview");
    }
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPreviewType("");
    setPreviewName("");
    setTiffPages([]);
    setTiffTotalPages(0);
    setTiffError(null);
    setLoadingTiff(false);
  };

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = async (fileName) => {
    try {
      const response = await api.get(
        `AppealsAndGrievances/DownloadInvoiceFile/${fileName}`,
        {
          responseType: "blob",
          validateStatus: () => true,
        }
      );

      if (response.status === 404) {
        Modal.error({
          title: "File Not Found",
          content: "The requested file was not found on the shared drive.",
          centered: true,
          okText: "Close",
          getContainer: false,
        });
        return;
      }

      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("text/plain")) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          if (text.includes("File not found")) {
            Modal.error({
              title: "File Not Found",
              content: "The requested file was not found on the shared drive.",
              centered: true,
              okText: "Close",
            });
          }
        };
        reader.readAsText(response.data);
        return;
      }

      if (response.status === 200) {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        message.error("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Failed to download file");
    }
  };

  const formatLabel = (label) =>
    label
      .replace(/([A-Z])/g, " $1")
      .replace(/[_]/g, " ")
      .replace(/^./, (str) => str.toUpperCase());

  const hasValidData = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (v && typeof v === "object") return hasValidData(v);
      return v !== null && v !== undefined && v !== "";
    });
  };

  const renderGrid = (obj) => {
    if (!obj) return <p>No data available</p>;
    return (
      <div className="detail-box">
        <div className="detail-grid">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} className="detail-item">
              <label className="detail-label">{formatLabel(key)}</label>
              <input
                className="detail-input"
                type="text"
                value={
                  value === null || value === undefined || value === ""
                    ? ""
                    : Array.isArray(value)
                    ? JSON.stringify(value)
                    : value
                }
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text) => (
        <>
          <FilePdfOutlined style={{ color: "red", marginRight: 8 }} />
          {text}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.fileName)}
          >
            Download
          </Button>
          <Divider
            type="vertical"
            style={{
              margin: "0 8px",
              height: "20px",
              borderColor: "#888787ff",
            }}
          />
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewOpen(record.fileName)}
          >
            Preview
          </Button>
        </>
      ),
    },
  ];

  if (loadingIncident) {
    return (
      <div style={{ textAlign: "center", marginTop: "120px" }}>
        <GradientCircularProgress />
        <p style={{ marginTop: "10px", color: "#666" }}>
          Loading incident details...
        </p>
      </div>
    );
  }

  if (!incidentData)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <GradientCircularProgress />
      </div>
    );

  const tabItems = [
    {
      key: "incident",
      label: "Incident Details",
      icon: <FileTextOutlined />,
      children: renderGrid({
        status: incidentData.status,
        assignedToName: incidentData.assignedToName,
        resolvedDate: incidentData.resolvedDate,
        utcResolvedDate: incidentData.utcResolvedDate,
        callerId: incidentData.callerId,
        monitorDate: incidentData.monitorDate,
        hearingDate: incidentData.hearingDate,
        appealDate: incidentData.appealDate,
        categoryDescription: incidentData.categoryDescription,
        enrollId: incidentData.enrollId,
        incidentId: incidentData.incidentId,
        caseType: incidentData.caseType,
        itineraryId: incidentData.itineraryID,
        itineraryDescription: incidentData.itineraryDescription,
        priority: incidentData.priority,
        receivedDate: incidentData.receivedDate,
        dueDate: incidentData.dueDate,
      }),
    },

    {
      key: "contact",
      label: "Contact Info",
      icon: <ContactsOutlined />,
      children: (
        <>
          {incidentData.incidentContactDetails &&
            incidentData.incidentContactDetails.map((c, idx) => (
              <div key={idx}>
                <h6 className="sub-section-header">Contact Info</h6>
                {renderGrid(c.incidentContact.contactInfo)}
                <h6 className="sub-section-header">Incident Contact Meta</h6>
                {renderGrid({
                  relationshipToAppellant:
                    c.incidentContact.relationshipToAppellant,
                  contactType: c.incidentContact.contactType,
                  isInitial: c.incidentContact.isInitial,
                  isAppellant: c.incidentContact.isAppellant,
                  entityId: c.incidentContact.entityId,
                })}
              </div>
            ))}
        </>
      ),
    },

    {
      key: "member",
      label: "Member Details",
      icon: <UserOutlined />,
      children: (() => {
        const member = incidentData.memberDetails;
        const hasMemberData = hasValidData(member);

        if (!hasMemberData) {
          return (
            <div className="border rounded p-3 text-center text-muted">
              No Member data found
            </div>
          );
        }

        return (
          <>
            {(() => {
              const memberMain = {
                memberId: member?.memberId,
                memberName: member?.memberName,
                memberNameToUse: member?.memberNameToUse,
                memberStatus: member?.memberStatus,
                memberDob: member?.memberDoB,
                memberDeathDate: member?.memberDeathDate,
                memberSecondaryId: member?.memberSecondaryId,
                memberSsn: member?.memberSsn,
                memberEmail: member?.memberEmail,
              };
              const hasMainData = Object.values(memberMain).some((v) => v);
              return hasMainData ? renderGrid(memberMain) : null;
            })()}

            {member?.address?.some(
              (addr) =>
                addr.type === 1 &&
                Object.entries(addr).some(([k, v]) => k !== "type" && v)
            ) && (
              <>
                <h6 className="sub-section-header">Primary Address</h6>
                {member.address
                  .filter(
                    (addr) =>
                      addr.type === 1 &&
                      Object.entries(addr).some(([k, v]) => k !== "type" && v)
                  )
                  .map((addr, idx) => {
                    const { type, ...addrWithoutType } = addr;
                    return (
                      <div key={`member-primary-${idx}`}>
                        {renderGrid(addrWithoutType)}
                      </div>
                    );
                  })}
              </>
            )}

            {member?.address?.some(
              (addr) =>
                addr.type === 0 &&
                Object.entries(addr).some(([k, v]) => k !== "type" && v)
            ) && (
              <>
                <h6 className="sub-section-header">Secondary Address</h6>
                {member.address
                  .filter(
                    (addr) =>
                      addr.type === 0 &&
                      Object.entries(addr).some(([k, v]) => k !== "type" && v)
                  )
                  .map((addr, idx) => {
                    const { type, ...addrWithoutType } = addr;
                    return (
                      <div key={`member-secondary-${idx}`}>
                        {renderGrid(addrWithoutType)}
                      </div>
                    );
                  })}
              </>
            )}

            {member?.phoneNumber?.some((p) => p.number) && (
              <>
                <h6 className="sub-section-header">Phone Numbers</h6>
                {member.phoneNumber
                  .filter((p) => p.number)
                  .map((p, idx) => {
                    const { type, ...phoneWithoutType } = p;
                    return (
                      <div key={`member-phone-${idx}`}>
                        {renderGrid(phoneWithoutType)}
                      </div>
                    );
                  })}
              </>
            )}
          </>
        );
      })(),
    },

    {
      key: "provider",
      label: "Provider Details",
      icon: <SolutionOutlined />,
      children: (() => {
        const provider = incidentData.providerDetails;
        const hasProviderData = hasValidData(provider);

        if (!hasProviderData) {
          return (
            <div className="border rounded p-3 text-center text-muted">
              No Provider data found
            </div>
          );
        }

        return (
          <>
            {(() => {
              const providerMain = {
                providerId: provider?.providerId,
                providerName: provider?.providerName,
                providerNpi: provider?.providerNpi,
                providerEmail: provider?.providerEmail,
              };
              const hasMainData = Object.values(providerMain).some((v) => v);
              return hasMainData ? renderGrid(providerMain) : null;
            })()}

            {provider?.address?.some(
              (addr) =>
                addr.type === 1 &&
                Object.entries(addr).some(([k, v]) => k !== "type" && v)
            ) && (
              <>
                <h6 className="sub-section-header">Primary Address</h6>
                {provider.address
                  .filter(
                    (addr) =>
                      addr.type === 1 &&
                      Object.entries(addr).some(([k, v]) => k !== "type" && v)
                  )
                  .map((addr, idx) => {
                    const { type, ...addrWithoutType } = addr;
                    return (
                      <div key={`provider-primary-${idx}`}>
                        {renderGrid(addrWithoutType)}
                      </div>
                    );
                  })}
              </>
            )}

            {provider?.address?.some(
              (addr) =>
                addr.type === 0 &&
                Object.entries(addr).some(([k, v]) => k !== "type" && v)
            ) && (
              <>
                <h6 className="sub-section-header">Secondary Address</h6>
                {provider.address
                  .filter(
                    (addr) =>
                      addr.type === 0 &&
                      Object.entries(addr).some(([k, v]) => k !== "type" && v)
                  )
                  .map((addr, idx) => {
                    const { type, ...addrWithoutType } = addr;
                    return (
                      <div key={`provider-secondary-${idx}`}>
                        {renderGrid(addrWithoutType)}
                      </div>
                    );
                  })}
              </>
            )}

            {provider?.phoneNumber?.some((p) => p.number) && (
              <>
                <h6 className="sub-section-header">Phone Numbers</h6>
                {provider.phoneNumber
                  .filter((p) => p.number)
                  .map((p, idx) => {
                    const { type, ...phoneWithoutType } = p;
                    return (
                      <div key={`provider-phone-${idx}`}>
                        {renderGrid(phoneWithoutType)}
                      </div>
                    );
                  })}
              </>
            )}
          </>
        );
      })(),
    },

    {
      key: "incidentDetails",
      label: "Claim Details",
      icon: <ProfileOutlined />,
      children: (
        <>
          {incidentData.incidentDetails.map((detail, idx) => (
            <div key={`incident-detail-${idx}`}>
              {detail.detailType === "Claim" && (
                <>
                  {renderGrid({
                    claimId: detail.detailId,
                    detailType: detail.detailType,
                  })}
                </>
              )}
            </div>
          ))}
        </>
      ),
    },

    {
      key: "invoice",
      label: "Documents",
      icon: <FileTextOutlined />,
      children: (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {alertMessage && (
            <Alert
              severity="warning"
              onClose={() => setAlertMessage("")}
              style={{ marginBottom: 16 }}
            >
              {alertMessage}
            </Alert>
          )}

          {loadingFiles ? (
            <>
              <GradientCircularProgress />
              <p style={{ marginTop: "10px", color: "#666" }}>
                Loading invoices...
              </p>
            </>
          ) : invoiceFiles.length > 0 ? (
            <Table
              dataSource={invoiceFiles.map((f, idx) => ({
                key: idx,
                fileName: f,
              }))}
              columns={columns}
              pagination={false}
              bordered
            />
          ) : (
            <p style={{ color: "#888", fontStyle: "italic" }}>
              No documents found for this incident.
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h4 className="mb-4">Incident {id} Details</h4>
      <Tabs defaultActiveKey="incident" items={tabItems} />
      <div className="button-row mt-3">
        <Button type="default" size="small" onClick={() => navigate(-1)}>
          &larr; Back
        </Button>
      </div>

      <Modal
        title={`Preview - ${previewName}`}
        open={previewVisible}
        onCancel={handlePreviewClose}
        width={800}
        footer={null}
        centered
      >
        <div style={{ minHeight: 200 }}>
          {previewType === "pdf" && previewUrl && (
            <div style={{ height: "75vh" }}>
              <embed
                src={previewUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </div>
          )}

          {previewType === "image" && previewUrl && (
            <div style={{ textAlign: "center" }}>
              <img
                src={previewUrl}
                alt={previewName}
                style={{ maxWidth: "100%", maxHeight: "75vh" }}
              />
            </div>
          )}

          {previewType === "tiff" && (
            <div>
              {loadingTiff && (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <GradientCircularProgress />
                  <p style={{ marginTop: "10px", color: "#666" }}>
                    Loading file
                  </p>
                </div>
              )}

              {!loadingTiff && tiffError && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div
                    style={{
                      color: "#dc3545",
                      marginBottom: "10px",
                      fontSize: "16px",
                    }}
                  >
                    {tiffError}
                  </div>
                </div>
              )}

              {!loadingTiff && !tiffError && tiffPages.length > 0 && (
                <>
                  {tiffTotalPages > 5 && (
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid red",
                        borderRadius: "4px",
                        padding: "10px 14px",
                        marginBottom: "16px",
                        color: "red",
                        fontSize: "13px",
                      }}
                    >
                      Displaying the first 5 of {tiffTotalPages} pages.{" "}
                      <a
                        href="#download"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownload(previewName);
                        }}
                        style={{
                          color: "#007bff",
                          textDecoration: "underline",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Click here
                      </a>{" "}
                      to download the full document.
                    </div>
                  )}
                  <div
                    style={{
                      maxHeight: "70vh",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {tiffPages.map((page, index) => (
                      <div
                        key={page.pageNumber}
                        style={{
                          marginBottom: tiffPages.length > 1 ? "30px" : "0",
                          borderBottom:
                            index < tiffPages.length - 1
                              ? "2px solid #ddd"
                              : "none",
                          paddingBottom:
                            index < tiffPages.length - 1 ? "20px" : "0",
                        }}
                      >
                        {tiffPages.length > 1 && (
                          <div
                            style={{
                              textAlign: "center",
                              fontWeight: "600",
                              color: "#666",
                              marginBottom: "8px",
                              fontSize: "14px",
                            }}
                          >
                            Page {page.pageNumber}
                            {tiffTotalPages > 5
                              ? ` of ${tiffTotalPages}`
                              : ""}
                          </div>
                        )}
                        <div style={{ textAlign: "center" }}>
                          <img
                            src={page.dataUrl}
                            alt={`${previewName} - Page ${page.pageNumber}`}
                            style={{
                              maxWidth: "100%",
                              height: "auto",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!loadingTiff &&
                !tiffError &&
                tiffPages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p className="text-muted">
                      No preview available. Please download the file to view it.
                    </p>
                  </div>
                )}
            </div>
          )}

          {previewType === "unknown" && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p className="text-muted">
                No preview available for this file type.
              </p>
            </div>
          )}

          {tiffError && previewType !== "tiff" && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ color: "#dc3545", fontSize: "16px" }}>
                {tiffError}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default IncidentDetail;
