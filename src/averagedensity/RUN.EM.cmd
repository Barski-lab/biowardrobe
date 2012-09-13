@echo off
@rem del *.log


"debug/averagedensity.exe" -in="EM-H2AZ-208-7.bam" -out="EM-H2AZ-208-7.csv" -log="EM-H2AZ-208-7.log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.em" -avd_window=2000 -avd_smooth=50 -plot_ext="svg" -gnuplot="cmd /C \"C:\Program Files (x86)\gnuplot\bin\gnuplot.exe\""
"debug/averagedensity.exe" -in="EM-H3K4me1-Duplicate-319-6.bam" -out="EM-H3K4me1-Duplicate-319-6.csv" -log="EM-H3K4me1-Duplicate-319-6.log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.em" -avd_window=2000 -avd_smooth=50 -plot_ext="svg" -gnuplot="cmd /C \"C:\Program Files (x86)\gnuplot\bin\gnuplot.exe\""
"debug/averagedensity.exe" -in="EM-H3K4me3-Duplicate-241-5.bam" -out="EM-H3K4me3-Duplicate-241-5.csv" -log="EM-H3K4me3-Duplicate-241-5.log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.em" -avd_window=2000 -avd_smooth=50 -plot_ext="svg" -gnuplot="cmd /C \"C:\Program Files (x86)\gnuplot\bin\gnuplot.exe\""

@rem "debug/averagedensity.exe" -in=".bam" -out=".txt" -log=".log" -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -sam_siteshift=75 -batch="batch.em"

@rem CM-H2AZ-208-6.bam
@rem CM-H3K4me1-Duplicate-319-5.bam
@rem CM-H3K4me3-Duplicate-241-4.bam
@rem EM-H2AZ-208-7.bam
@rem EM-H3K4me1-Duplicate-319-6.bam
@rem EM-H3K4me3-Duplicate-241-5.bam
@rem Naive-H2AZ-208-5.bam
@rem Naive-H3K4me1-Duplicate-319-4.bam
@rem Naive-H3K4me3-Duplicate-236-8.bam
