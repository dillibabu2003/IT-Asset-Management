import axiosInstance from "../utils/axios";
import Loader from "../components/Loader";
import { PAGE_LIMIT } from "../utils/constants";
import InvoiceSection1 from "../components/InvoiceSection1";
import InvoiceTable from "../components/InvoiceTable";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
const InvoicesPage = () => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(PAGE_LIMIT);
  const [deleteDialogInfo, setDeleteDialogInfo] = useState({
    showDialog: false,
    invoice_id: null,
  });
  async function fetchInvoicesByPageAndLimit(abortController, page, limit) {
    const response = await axiosInstance.get("/invoices/paginate", {
      params: {
        page: page,
        limit: limit,
      },
      signal: abortController.signal,
    });
    return response.data;
  }
  async function fetchInvoicesMetaData(abortController) {
    const response = await axiosInstance.get("/metadata/invoices", {
      signal: abortController.signal,
    });
    return response.data;
  }
  async function fetchUserColumnPreferences(abortController) {
    const response = await axiosInstance.get("/invoices/column-visibilities", {
      signal: abortController.signal,
    });
    return response.data;
  }
  async function refreshData() {
    const toastId = toast.loading("Refreshing data...");
    const abortController = new AbortController();
    fetchInvoicesByPageAndLimit(abortController, page, pageLimit)
      .then((response) => {
        const invoices = response.data;
        toast.success("Data refreshed", { id: toastId });
        setData((prev) => {
          return { ...prev, data: invoices };
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error("An error occurred while refreshing data", { id: toastId });
      });
  }
  async function deleteInvoice() {
    try {
      const response = await axiosInstance.delete(`/invoices/delete`, {
        data: {
          invoice_id: deleteDialogInfo.invoice_id,
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setDeleteDialogInfo((prev) => {
          return { ...prev, showDialog: false };
        });
        setTimeout(() => {
          refreshData();
        }, 1000);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const abortController = new AbortController();
    if (!data) {
      const fetchData = async () => {
        const invoicesPromise = fetchInvoicesByPageAndLimit(
          abortController,
          page,
          pageLimit,
        );
        const invoicesMetadataPromise = fetchInvoicesMetaData(abortController);
        const userColumnPreferencesPromise =
          fetchUserColumnPreferences(abortController);
        try {
          const response = await Promise.all([
            invoicesPromise,
            invoicesMetadataPromise,
            userColumnPreferencesPromise,
          ]);
          const invoices = response[0].data;
          const invoicesMetaData = response[1].data;
          const userColumnPreferences = response[2].data;
          console.log(data);
          console.log(response);

          setData({
            data: invoices,
            fields: invoicesMetaData,
            userColumnPreferences: userColumnPreferences,
          });
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    } else {
      fetchInvoicesByPageAndLimit(abortController, page, pageLimit)
        .then((response) => {
          setData((prev) => ({ ...prev, data: response.data }));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return !data ? (
    <Loader />
  ) : (
    // <InvoiceSection />
    <Box sx={{ p: 3 }}>
      <InvoiceSection1 refreshData={refreshData} />

      <InvoiceTable
        columns={data.fields}
        rows={data.data.invoices}
        userColumnPreferences={data.userColumnPreferences}
        page={page}
        setPage={setPage}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        totalInvoices={data.data.totalInvoices}
        setDeleteDialogInfo={setDeleteDialogInfo}
      />

      <Dialog
        open={deleteDialogInfo.showDialog}
        onClose={() =>
          setDeleteDialogInfo((prev) => {
            return { ...prev, showDialog: false };
          })
        }
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the invoice{" "}
          {deleteDialogInfo.invoice_id}?
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            This action cannot be reverted, all the licenses and assets belong
            to this invoice will be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialogInfo((prev) => {
                return { ...prev, showDialog: false };
              })
            }
          >
            Cancel
          </Button>
          <Button onClick={deleteInvoice} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicesPage;
