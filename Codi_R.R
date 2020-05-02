# Configurem el nostre workspace:
library(pd.hugene.2.0.st)
carp_global <- getwd()
dir.create("dades")
carp_dades <- file.path(carp_global, "dades/")
dir.create("resultats")
carp_resultats <- file.path(carp_global, "resultats/")


#Descarreguem les dades:
library(GEOquery)
getGEOSuppFiles(GEO = "GSE148501", makeDirectory = F, baseDir = carp_dades)

# Descomprimim els arxius CEL manualment, i generem el arxiu targets.csv

# Llegim els arxius generats i descomprimits
library(oligo)
library(Biobase)
cel_files <- list.celfiles(carp_dades, full.names = TRUE)
targets <- read.AnnotatedDataFrame(file.path(carp_dades, "targets.csv"), header = TRUE, row.names = 1, sep= ";")
raw_data <- read.celfiles(cel_files, phenoData = targets)

# Aquest es el format del nostre target.csv
pData(raw_data)


# Control de qualitat de les dades:
library(arrayQualityMetrics)
arrayQualityMetrics(raw_data, outdir = file.path(carp_resultats, "QM_Raw")) 

# De l'index de resultats extraiem la taula resum
# knitr::include_graphics("resultats/QM_Raw/QM_RAW_resum.png")

# Analisis de les dades gràficament:
library(ggplot2)
library(ggrepel)
boxplot(raw_data, cex.axis = 0.5, las=2, which="all", main="", col = c(rep("gold2", 3), rep("darkorange", 3), rep("red3", 3), rep("lightblue1", 2), rep("deepskyblue3", 3),rep("darkslateblue", 3)))
plot(hclust(dist(t(exprs(raw_data)))))

# Normalització de les dades:
rma_data <- rma(raw_data)

# Controls de qualitat:
arrayQualityMetrics(rma_data, outdir = file.path(carp_resultats, "QM_RMA")) 
# De l'index de resultats extraiem la taula resum
# knitr::include_graphics("resultats/QM_RMA/QM_Rma_resum.png")
boxplot(rma_data, cex.axis = 0.5, las=2, which="all", main="", col = c(rep("gold2", 3), rep("darkorange", 3), rep("red3", 3), rep("lightblue1", 2), rep("deepskyblue3", 3),rep("darkslateblue", 3)))
plot(hclust(dist(t(exprs(rma_data)))))

# Detecció de gens mes variables dintre del conjunt de mostres:
sds <- apply(exprs(rma_data), 1, sd)
plot(1:length(sds), sort(sds), xlab="Genes desde el menos al más variable", ylab="Desviación estándar")
abline(v=length(sds)*c(0.9,0.95))

# Filtratge no especific
library(genefilter)
library(DBI)
library(pd.zebgene.1.1.st)
annotation(rma_data) <- "pd.zebgene.1.1.st"
filtered <- nsFilter(rma_data, require.entrez = FALSE, remove.dupEntrez = FALSE, var.filter=TRUE, var.func=IQR, var.cutoff=0.7, filterByQuantile=TRUE)
filtered_data <- filtered$eset

# Controls de qualitat:
arrayQualityMetrics(filtered_data, outdir = file.path(carp_resultats, "QM_Filt")) 
# De l'index de resultats extraiem la taula resum
# knitr::include_graphics("resultats/QM_Filt/QM_FILT_resum.png")
boxplot(filtered_data, cex.axis = 0.5, las=2, which="all", main="", col = c(rep("gold2", 3), rep("darkorange", 3), rep("red3", 3), rep("lightblue1", 2), rep("deepskyblue3", 3),rep("darkslateblue", 3)))
plot(hclust(dist(t(exprs(filtered_data)))))

BiocManager::install("annaffy")
